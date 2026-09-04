import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import SelectDropdown from '@/components/SelectDropdown';
import { MaterialAPI, SchoolAPI } from '@/api';
import { addToast } from '@/redux/slice/toastSlice';
import {
  ApplicantType, ApplicationErrors, ResourceApplicationDraft, ResourcePackage, ResourceSchool,
  createApplicationDraft, mapMaterialResource, normalizeSchoolEmail, validateApplication,
} from '@/features/resources/model';
import UsageTerms from './UsageTerms';
import styles from './resources.module.scss';

function Field({ id, label, error, children, helper }: {
  id: string; label: string; error?: string; helper?: string; children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.fieldLabel}>{label} <span aria-hidden="true">*</span></label>
      {children}
      {helper && <p id={`${id}-help`} className={styles.helper}>{helper}</p>}
      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
    </div>
  );
}

export default function ApplicationForm() {
  const { t } = useTranslation('common', { keyPrefix: 'resources' });
  const { locale } = useRouter();
  const dispatch = useDispatch();
  const [draft, setDraft] = useState(createApplicationDraft);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [hasValidated, setHasValidated] = useState(false);
  const [schools, setSchools] = useState<ResourceSchool[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsLoadFailed, setSchoolsLoadFailed] = useState(false);
  const [resources, setResources] = useState<ResourcePackage[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesLoadFailed, setResourcesLoadFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const school = schools.find(item => item.id === draft.schoolId);
  const isSchool = draft.applicantType === 'school';
  const types: ApplicantType[] = ['school', 'media', 'other'];

  useEffect(() => {
    let active = true;
    async function loadSchools() {
      try {
        const response = await SchoolAPI.getSchoolList();
        if (response.data.code !== 0 || !Array.isArray(response.data.data?.data)) {
          throw new Error('School list unavailable');
        }
        if (active) {
          setSchools(response.data.data.data.map(item => ({
            id: String(item.id),
            name: { en: item.nameEn || item.nameZh, zh: item.nameZh || item.nameEn },
            emailDomain: item.emailDomain?.trim() || '',
          })));
        }
      } catch {
        if (active) setSchoolsLoadFailed(true);
      } finally {
        if (active) setSchoolsLoading(false);
      }
    }
    loadSchools();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadResources() {
      try {
        const response = await MaterialAPI.getMaterialList();
        if (response.data.code !== 0 || !Array.isArray(response.data.data?.materials)) {
          throw new Error('Resource list unavailable');
        }
        if (active) {
          const nextResources = response.data.data.materials
            .map(mapMaterialResource)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          setResources(nextResources);
          setDraft(previous => previous.resourceIds.length || !nextResources.length
            ? previous
            : { ...previous, resourceIds: [nextResources[0].id] });
        }
      } catch {
        if (active) setResourcesLoadFailed(true);
      } finally {
        if (active) setResourcesLoading(false);
      }
    }
    loadResources();
    return () => { active = false; };
  }, []);

  function update<K extends keyof ResourceApplicationDraft>(key: K, value: ResourceApplicationDraft[K]) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (hasValidated) setErrors(validateApplication(next, schools, resources));
  }

  function switchApplicantType(applicantType: ApplicantType) {
    setDraft(previous => ({ ...previous, applicantType }));
    setErrors({});
    setHasValidated(false);
  }

  const errorText = (field: keyof ResourceApplicationDraft) => errors[field] ? t(`errors.${errors[field]}`) : undefined;
  const inputProps = (field: keyof ResourceApplicationDraft, help = false) => ({
    id: `resource-${field}`,
    name: field,
    required: true,
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': [help ? `resource-${field}-help` : '', errors[field] ? `resource-${field}-error` : ''].filter(Boolean).join(' ') || undefined,
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateApplication(draft, schools, resources);
    setHasValidated(true);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      dispatch(addToast({ message: t('checkForm') }));
      requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        firstInvalid?.focus();
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    const selectedSchool = schools.find(item => item.id === draft.schoolId);
    const isSchoolApplication = draft.applicantType === 'school';
    const applicantType: API.ApplyMaterialParams['applicantType'] =
      draft.applicantType === 'school' ? 1 : draft.applicantType === 'media' ? 2 : 3;
    const payload: API.ApplyMaterialParams = {
      applicantType,
      fullName: draft.fullName.trim(),
      materialIds: draft.resourceIds,
      phoneNumber: draft.phone.trim(),
      purposeDescription: isSchoolApplication ? '-' : draft.purposeDescription.trim(),
      rolePosition: draft.position.trim(),
      termsAgreed: draft.agreed,
      workEmail: isSchoolApplication
        ? `${draft.emailPrefix.trim()}@${selectedSchool?.emailDomain}`
        : draft.workEmail.trim(),
      ...(isSchoolApplication
        ? { schoolId: Number(draft.schoolId) }
        : { organizationName: draft.organization.trim() }),
    };

    setSubmitting(true);
    try {
      const response = await MaterialAPI.apply(payload);
      if (response.data.code !== 0) {
        dispatch(addToast({
          message: response.data.error || response.data.msg || t('submitFailed'),
          type: 'error',
        }));
        return;
      }
      dispatch(addToast({ message: t('submitSuccess'), type: 'success' }));
      setDraft({ ...createApplicationDraft(), resourceIds: resources[0] ? [resources[0].id] : [] });
      setErrors({});
      setHasValidated(false);
    } catch {
      dispatch(addToast({ message: t('submitFailed'), type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} ref={formRef} noValidate onSubmit={submit}>
      <div className={styles.formHeading}>
        <h2>{t('formTitle')}</h2>
        <p>{t('formIntro')}</p>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldLabel}>{t('applicantType')} <span aria-hidden="true">*</span></legend>
        <div className={styles.applicantTypes}>
          {types.map(type => (
            <label key={type} className={`${styles.applicantOption} ${draft.applicantType === type ? styles.applicantSelected : ''}`}>
              <input type="radio" name="applicantType" value={type} checked={draft.applicantType === type} onChange={() => switchApplicantType(type)} />
              <span>{t(`types.${type}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.fields}>
        {isSchool ? (
          <Field id="resource-schoolId" label={t('fields.school')} error={schoolsLoadFailed ? t('errors.schoolLoad') : errorText('schoolId')}>
            <SelectDropdown
              id="resource-schoolId"
              name="schoolId"
              ariaLabel={t('fields.school')}
              ariaDescribedBy={errors.schoolId || schoolsLoadFailed ? 'resource-schoolId-error' : undefined}
              invalid={Boolean(errors.schoolId) || schoolsLoadFailed}
              required
              disabled={schoolsLoading || !schools.length}
              value={draft.schoolId}
              options={schools.map(item => ({ value: item.id, label: item.name[locale === 'en' ? 'en' : 'zh'] }))}
              placeholder={t(schoolsLoading ? 'placeholders.schoolLoading' : !schools.length ? 'placeholders.schoolEmpty' : 'placeholders.school')}
              onChange={value => update('schoolId', String(value))}
              rightIconSrc="/images/resources/chevron-down.svg"
              className={`${styles.schoolSelect} ${errors.schoolId || schoolsLoadFailed ? styles.invalid : ''}`}
            />
          </Field>
        ) : (
          <Field id="resource-organization" label={t('fields.organization')} error={errorText('organization')}>
            <input {...inputProps('organization')} className={styles.input} value={draft.organization} onChange={event => update('organization', event.target.value)} placeholder={t(`placeholders.${draft.applicantType === 'media' ? 'mediaOrganization' : 'organization'}`)} maxLength={200} autoComplete="organization" />
          </Field>
        )}

        {isSchool ? (
          <Field id="resource-emailPrefix" label={t('fields.email')} error={errorText('emailPrefix')} helper={t('schoolEmailHelp')}>
            <div className={`${styles.emailInput} ${!school?.emailDomain ? styles.emailDisabled : ''} ${errors.emailPrefix ? styles.invalid : ''}`}>
              <input
                {...inputProps('emailPrefix', true)}
                disabled={!school?.emailDomain}
                value={draft.emailPrefix}
                onChange={event => update('emailPrefix', normalizeSchoolEmail(event.target.value, school?.emailDomain))}
                placeholder={t('placeholders.emailPrefix')}
                maxLength={254}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-describedby={`resource-emailPrefix-help resource-email-suffix${errors.emailPrefix ? ' resource-emailPrefix-error' : ''}`}
              />
              <span id="resource-email-suffix" className={styles.emailSuffix} aria-live="polite">@{school?.emailDomain || '***.**'}</span>
            </div>
          </Field>
        ) : (
          <Field id="resource-workEmail" label={t('fields.email')} error={errorText('workEmail')} helper={t('workEmailHelp')}>
            <input {...inputProps('workEmail', true)} className={styles.input} type="email" value={draft.workEmail} onChange={event => update('workEmail', event.target.value)} placeholder={t('placeholders.workEmail')} maxLength={254} autoComplete="email" autoCapitalize="none" spellCheck={false} />
          </Field>
        )}

        <Field id="resource-fullName" label={t('fields.name')} error={errorText('fullName')}>
          <input {...inputProps('fullName')} className={styles.input} value={draft.fullName} onChange={event => update('fullName', event.target.value)} placeholder={t('placeholders.name')} maxLength={120} autoComplete="name" />
        </Field>
        <Field id="resource-position" label={t('fields.position')} error={errorText('position')}>
          <input {...inputProps('position')} className={styles.input} value={draft.position} onChange={event => update('position', event.target.value)} placeholder={t(`positionExamples.${draft.applicantType}`)} maxLength={120} autoComplete="organization-title" />
        </Field>
        <Field id="resource-phone" label={t('fields.phone')} error={errorText('phone')}>
          <input {...inputProps('phone')} className={styles.input} type="tel" value={draft.phone} onChange={event => update('phone', event.target.value)} placeholder="+86 138 0000 0000" maxLength={30} autoComplete="tel" />
        </Field>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.fieldLabel}>{t('resourceSelection')} <span aria-hidden="true">*</span></legend>
        <p className={styles.resourceHelp}>{t('resourceHelp')}</p>
        {resourcesLoading ? (
          <p className={styles.resourceHelp} role="status">{t('resourceLoading')}</p>
        ) : resourcesLoadFailed ? (
          <p className={styles.error} role="alert">{t('errors.resourceLoad')}</p>
        ) : !resources.length ? (
          <p className={styles.resourceHelp}>{t('resourceEmpty')}</p>
        ) : (
          <div className={styles.resourceOptions}>
            {resources.map(resource => {
              const checked = draft.resourceIds.includes(resource.id);
              const resourceLocale = locale === 'en' ? 'en' : 'zh';
              const resourceName = resource.name[resourceLocale];
              return (
                <label key={resource.id} className={`${styles.resourceOption} ${checked ? styles.resourceSelected : ''}`}>
                  <span className={styles.resourceCopy}>
                    <strong>{resourceName}</strong>
                    <span>{resource.description[resourceLocale] || resource.fileName}</span>
                  </span>
                  <input type="checkbox" className={styles.checkbox} name="resourceIds" value={resource.id} checked={checked} aria-label={resourceName} aria-invalid={Boolean(errors.resourceIds)} aria-describedby={errors.resourceIds ? 'resource-resourceIds-error' : undefined} onChange={() => update('resourceIds', checked ? draft.resourceIds.filter(id => id !== resource.id) : [...draft.resourceIds, resource.id])} />
                </label>
              );
            })}
          </div>
        )}
        {errors.resourceIds && !resourcesLoadFailed && <p id="resource-resourceIds-error" className={styles.error}>{errorText('resourceIds')}</p>}
      </fieldset>

      {!isSchool && (
        <Field id="resource-purposeDescription" label={t('fields.use')} error={errorText('purposeDescription')}>
          <textarea {...inputProps('purposeDescription')} className={`${styles.input} ${styles.textarea}`} value={draft.purposeDescription} onChange={event => update('purposeDescription', event.target.value)} placeholder={t(draft.applicantType === 'media' ? 'placeholders.mediaUse' : 'placeholders.use')} maxLength={2000} rows={2} />
        </Field>
      )}

      <div className={styles.submitSection}>
        <div className={styles.consent}>
          <input {...inputProps('agreed')} className={styles.checkbox} type="checkbox" aria-label={`${t('consentPrefix')}${t('terms')}${t('consentSuffix')}`} checked={draft.agreed} onChange={event => update('agreed', event.target.checked)} />
          <div><label htmlFor="resource-agreed">{t('consentPrefix')}</label><UsageTerms />{t('consentSuffix')}</div>
        </div>
        {errors.agreed && <p id="resource-agreed-error" className={styles.error}>{errorText('agreed')}</p>}
        <button type="submit" className={styles.primaryButton} disabled={submitting || resourcesLoading || resourcesLoadFailed || !resources.length || (isSchool && (schoolsLoading || schoolsLoadFailed))}>
          {t(submitting ? 'submitting' : 'submit')}
          <img src="/images/resources/arrow-right.svg" alt="" width={20} height={20} />
        </button>
        <p className={styles.deliveryNote}>{t('deliveryNote')}</p>
      </div>
    </form>
  );
}

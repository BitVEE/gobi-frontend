import Image from 'next/image';
import { useState, useEffect, useRef, memo } from 'react';

const LoadingImg = memo((props: {
    src: string,
    style: React.CSSProperties,
    width: number,
    height: number,
    alt?: string,
    Fstyle?: React.CSSProperties,
    placeholderSrc?: string,
    lazyLoad?: boolean
}) => {
    const [loading, setLoading] = useState(true)
    const [placeholderSrc, setPlaceholderSrc] = useState(props.placeholderSrc || "/images/icons/loading-img.svg")
    const [errorSrc, setErrorSrc] = useState(props.placeholderSrc || "/images/icons/loading-img-error.svg")
    const [isInView, setIsInView] = useState(false)
    const imgRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (props.src) {
            setPlaceholderSrc(props?.placeholderSrc || "/images/icons/loading-img.svg")
            setErrorSrc(props?.placeholderSrc || "/images/icons/loading-img-error.svg")
        }
    }, [props.src, props.placeholderSrc])

    useEffect(() => {
        if (props.src) {
            if (props.lazyLoad) {
                const observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            setIsInView(true)
                            observer.unobserve(entry.target)
                        }
                    },
                    {
                        rootMargin: '100px', // 对应原LazyLoad的offset={100}
                        threshold: 0.1
                    }
                )

                if (imgRef.current) {
                    observer.observe(imgRef.current)
                }

                return () => {
                    if (imgRef.current) {
                        observer.unobserve(imgRef.current)
                    }
                }
            } else {
                setIsInView(true)
            }
        }
    }, [props.src, props.lazyLoad])

    return (
        <div ref={imgRef} style={{ fontSize: "0px" }}>
            {!isInView ? placeholderSrc && (
                <Image
                    src={placeholderSrc}
                    priority={true}
                    width={props.width}
                    height={props.height}
                    alt={props.alt || ''}
                    style={{
                        objectFit: "cover",
                        minWidth: "100%",
                        maxWidth: "100%",
                        minHeight: "100%",
                        maxHeight: "100%",
                        ...props.style
                    }}
                />
            ) : (
                <div style={{ ...props.style, position: "relative", ...props.Fstyle }}>
                    <Image
                        src={props.src}
                        width={props.width}
                        height={props.height}
                        priority={true}
                        style={{
                            objectFit: "cover",
                            minWidth: "100%",
                            maxWidth: "100%",
                            minHeight: "100%",
                            maxHeight: "100%",
                            opacity: loading ? 0 : 1,
                            ...props.style
                        }}
                        onLoad={() => {
                            setLoading(false)
                        }}
                        onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            img.src = errorSrc;
                        }}
                        alt={props.alt || ''}
                    />
                    {loading && placeholderSrc && (
                        <Image
                            src={placeholderSrc}
                            width={props.width}
                            height={props.height}
                            style={{
                                objectFit: "cover",
                                minWidth: "100%",
                                maxWidth: "100%",
                                minHeight: "100%",
                                maxHeight: "100%",
                                position: "absolute",
                                top: "0",
                                left: "0",
                                ...props.style
                            }}
                            priority
                            onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                img.src = errorSrc;
                            }}
                            alt={props.alt || ''}
                        />
                    )}
                </div>
            )}
        </div>
    )
});

LoadingImg.displayName = 'LoadingImg';

export default LoadingImg;
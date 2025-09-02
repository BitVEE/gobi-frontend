import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

const LoadingImg = (props: { src: string, style: React.CSSProperties, width: number, height: number, alt?: string }) => {
    const [loading, setLoading] = useState(true)
    const [placeholderSrc, setPlaceholderSrc] = useState("/images/home/poster.png")
    const [isInView, setIsInView] = useState(false)
    const imgRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (props.src) {
            if (props.src !== "/images/home/poster.png" && props.src.includes("imagedelivery.net") && !props.src.includes("Blur")) {
                setPlaceholderSrc(props.src + "Blur")
            } else {
                setPlaceholderSrc("/images/home/poster.png")
            }
        }
    }, [props.src])

    useEffect(() => {
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
    }, [])

    if (!props.src) {
        return null;
    }

    return (
        <div ref={imgRef} style={{ fontSize: "0px" }}>
            {!isInView ? (
                <Image
                    src={placeholderSrc}
                    width={props.width}
                    height={props.height}
                    alt={props.alt || ''}
                    style={{
                        ...props.style,
                        objectFit: "cover",
                        maxWidth: "100%"
                    }}
                />
            ) : (
                <div style={{ ...props.style, position: "relative" }}>
                    <Image
                        src={props.src}
                        width={props.width}
                        height={props.height}
                        priority={true}
                        style={{
                            ...props.style,
                            objectFit: "cover",
                            minWidth: "100%",
                            maxWidth: "100%",
                            minHeight: "100%",
                            maxHeight: "100%",
                            opacity: loading ? 0 : 1
                        }}
                        onLoad={() => {
                            setTimeout(() => { setLoading(false); }, 300);
                        }}
                        onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            img.src = placeholderSrc;
                        }}
                        alt={props.alt || ''}
                    />
                    {loading && (
                        <Image
                            src={placeholderSrc}
                            width={props.width}
                            height={props.height}
                            style={{
                                ...props.style,
                                objectFit: "cover",
                                minWidth: "100%",
                                maxWidth: "100%",
                                minHeight: "100%",
                                maxHeight: "100%",
                                position: "absolute",
                                top: "0",
                                left: "0"
                            }}
                            priority
                            onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                img.src = "/images/home/poster.png";
                            }}
                            alt={props.alt || ''}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default LoadingImg;
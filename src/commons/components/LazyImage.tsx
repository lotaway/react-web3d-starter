import {useState, useEffect, useRef} from "react"

interface IProps {
  src: string
  placeholder?: string
}

export default function LazyImage({src, placeholder = ""}: IProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isIn, setIsIn] = useState<boolean>(false)
  const callback: IntersectionObserverCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.target === imgRef.current && entry.isIntersecting)
        setIsIn(true)
    })
  }
  useEffect(() => {
    const observer = new IntersectionObserver(callback)
    if (imgRef?.current)
      observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])
  return (
    <img ref={imgRef} src={isIn ? src : placeholder}/>
  )
}
import React, {useRef, useEffect, PropsWithChildren} from 'react'
import "./DropdownMenu.sass"

export interface DropdownMenuProps extends PropsWithChildren {
    onClose?: Function
}

export default function DropdownMenu(props: DropdownMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                props.onClose?.()
            }
        }

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside)
        };
    }, [props])

    return (
        <div ref={menuRef} className="drop-down-menu">
            {props.children}
        </div>
    )
}
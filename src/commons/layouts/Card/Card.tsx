import {PropsWithChildren} from "react"
import "./Card.sass"
import {Link, Outlet, useLocation} from "react-router-dom";

interface CardProps extends PropsWithChildren {
    shadow?: boolean
}

interface CardTabProps {
    tabList: Array<{
        title: string
        path: string
    }>
}

interface CardHeaderProps extends PropsWithChildren {
}

interface CardBodyProps extends PropsWithChildren {
}

interface CardBelowProps extends PropsWithChildren {
    secTitle?: string
}

export default function Card(props: CardProps) {
    return (
        <section className={`card ${props.shadow ? "shadow" : ""}`}>
            <div className="wrapper">
                {props.children}
            </div>
        </section>
    )
}

Card.Tab = function ({tabList}: CardTabProps) {
    const location = useLocation()
    return (
        <Card>
            <Card.Body>
                <div className="card-tab">
                    <div className="card-tab-title flex justify-center">
                        {tabList.map((item, index) => (
                            <Link className={`link text-center transition-fast hover ${location.pathname.includes(item.path) ? "in-active" : "no-active"}`}
                                  key={item.path}
                                  to={item.path}
                            >{item.title}</Link>
                        ))}
                    </div>
                    <Outlet/>
                </div>
            </Card.Body>
        </Card>
    )
}

Card.Header = function ({children}: CardHeaderProps) {
    return (
        <h3 className="card-title">{children}</h3>)
}

Card.Body = function (props: CardBodyProps) {
    return (
        <div className="card-body">
            {props.children}
        </div>
    )
}
Card.Below = function ({children}: CardBelowProps) {
    return (
        <div className="layout-card-below">
            {children}
        </div>
    )
}

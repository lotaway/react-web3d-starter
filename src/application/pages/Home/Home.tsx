import {createRef, useEffect, useState} from 'react'
import {Link} from "react-router-dom"
import './Home.sass'
import NavBar from "../../../commons/components/NavBar/NavBar"
import PayContract from "../../../commons/components/PayContract/PayContract"
import Card from "../../../commons/layouts/Card/Card"
import Input from "../../../commons/components/Input/Input"
import {useTranslation} from 'react-i18next'
import {useAppDispatch, useAppSelector} from "../../../repository/store/hooks"
import {changeClickCount} from "../../../repository/store/modules/global"
import std from '../../../commons/utils/std'

export default function Home() {
    const {t} = useTranslation()
    const clickCount = useAppSelector(state => state.global.clickCount)
    const dispatch = useAppDispatch()
    const [addressTo, setAddressTo] = useState<string>("")
    const inputRef = createRef<HTMLInputElement>()
    const welcome_text = std.string.toShort("hello world from new world", 5)

    function showClickCount() {
        console.log((`${welcome_text}: ${clickCount}`))
    }

    useEffect(() => {

    }, [clickCount])

    useEffect(() => {
        const MESSAGE_DELAY = 5 * 1000
        const abortController = new AbortController()
        // const counter = setInterval(() => {
        fetch(`${import.meta.env.VITE_SERVER_HOST}/message`, {
            signal: abortController.signal
        }).then(res => {

        }).catch(err => {
            if (err.name === "AbortError") {
                console.log("Cancel by abort controller.")
            } else {

            }
        })
        // }, MESSAGE_DELAY)
        const timer = setInterval(() => {
            dispatch(changeClickCount(clickCount + 1))
        }, 1000)
        return () => {
            abortController.abort("reRender")
            // clearInterval(counter)
            clearInterval(timer)
        }
    }, [])
    return (
        <div className="min-h-screen home">
            <span onClick={() => showClickCount()}>{clickCount}</span>
            <div className="gradient-bg-welcome">
                <NavBar/>
                <Card>
                    <Card.Header>{t("welcome")}</Card.Header>
                    <Card.Body>
                        <Input ref={inputRef} type="text" value={addressTo}
                               onChange={event => setAddressTo(event.target.value)}/>
                        <PayContract addressTo={addressTo}/>
                    </Card.Body>
                    <Card.Below>
                        <Link to="/guide">Guide</Link>
                    </Card.Below>
                </Card>
            </div>
        </div>
    )
}

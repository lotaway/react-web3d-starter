import {createRef, MouseEvent, useCallback} from "react"
import {useNavigate} from "react-router-dom"
import "./SignUp.sass"
import Input from "../../../commons/components/Input/Input"

export default function SignUp() {
    const navigate = useNavigate()
    const usernameRef = createRef<HTMLInputElement>()
    const passwordRef = createRef<HTMLInputElement>()
    const repeatPwdRef = createRef<HTMLInputElement>()
    const validateData = useCallback(({usernameVal, passwordVal, repeatPwdVal}: any) => {
        let error = ""
        if (!usernameVal || !passwordVal || passwordVal !== repeatPwdVal) {
            error = "No Pass"
        }
        return error
    }, [])
    const submitHandle = async (event: MouseEvent) => {
        event?.preventDefault()
        const usernameVal = usernameRef?.current?.value ?? ""
        const passwordVal = passwordRef?.current?.value ?? ""
        const repeatPwdVal = repeatPwdRef?.current?.value ?? ""
        const error = validateData({usernameVal, passwordVal, repeatPwdVal})
        if (error) {
            return
        }
        const formData = new FormData()
        formData.set("username", usernameVal)
        formData.set("password", passwordVal)
        fetch(`/user/create`, {
            method: "POST",
            body: formData
        }).then(async response => {
            const result = await response.json()
            if (result.status !== 200) {
                console.log(result)
            }
            navigate("/user/center")
        }).catch(err => {
            console.log(err)
        })
    }
    return (
        <form className="sign-in">
            <ul className="list">
                <li className="item">
                    <Input title="Username" ref={usernameRef} required/>
                </li>
                <li className="item">
                    <Input ref={passwordRef} required/>
                </li>
                <li className="item">
                    <Input ref={repeatPwdRef} required/>
                </li>
            </ul>
            <button type="submit" className="py-3 px-4 bg bg-blue-500 font-bold white-500 rounded w-full"
                    onClick={submitHandle}>Sign Up
            </button>
        </form>
    )
}

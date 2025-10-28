import {useState} from "react"

export default function LogIn() {
    const [isLinking, setIsLinking] = useState(false)

    async function linkX() {
        if (isLinking)
            return
        setIsLinking(true)
        // @todo invoke api request,see:https://developer.twitter.com/en/docs/authentication/oauth-1-0a/obtaining-user-access-tokens
        const response = await fetch(
            "https://api.twitter.com/oauth/request_token", {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "POST",
            })
        response.json().then(data => {

        }).catch(err => {
            console.log(err)
        }).finally(() => {
            setIsLinking(false)
        })
    }

    const [isLinkingDiscord, setIsLinkingDiscord] = useState(true)

    async function linkDiscord() {
        if (isLinking)
            return
        setIsLinking(true)
        // @todo invoke api request, see:https://discord.com/developers/docs/topics/oauth2#shared-resources
        const response = await fetch(
            "@todo", {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "POST",
            })
        response.json().then(data => {

        }).catch(err => {
            console.log(err)
        }).finally(() => {
            setIsLinking(false)
        })
    }
    return (
        <p>LogIn Page</p>
    )
}

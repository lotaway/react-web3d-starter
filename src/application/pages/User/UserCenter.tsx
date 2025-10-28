import {useTranslation} from "react-i18next";

export default function UserCenter() {
    const {t} = useTranslation()
    return (
        <h1>{t("userCenterDesc")}</h1>
    );
};
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"


export default function Unauthorized() {
    const navigate = useNavigate()
    const {profile} = useAuth()

    const handleRedirect = () => {
        if(profile?.role=="user") {navigate("/user/dashboard", {replace: true})}
        return;
    }

    
    return (
        <div>
            <h1>You are not allowed to access this page</h1>
            <button onClick={handleRedirect}>Click here to go back to your dashboard</button>
        </div>
    )
}
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
//import NavBar from "../pages/components/NavBar";
import PillNav from "../pages/components/UIComponents/PillNav";
import Grainient from "../pages/components/UIComponents/Granient";
const logo = "/tab-logo.png";
import Footer from "../pages/components/Footer";
import GradualBlur from "../pages/components/UIComponents/GradualBlur";


const UserLayout = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname]);

    const items = [
                    { label: 'Dashboard', href: '/user/dashboard' },
                    { label: 'Recycle', href: '/user/recycle' },
                    { label: 'Request Pickup', href: '/user/pickup-requests'},
                    { label: 'Chat', href: '/user/chat' },
                    { label: 'Leaderboard', href: '/user/leaderboard' },
                    { label: 'Transactions', href: '/user/transactions' },
                    { label: 'Profile', href: '/user/profile' },
                ];
    return (
        <div className="relative min-h-screen w-full">
            {/* Grainient Background */}
            <div className="fixed inset-0 w-full h-full -z-10">
                <Grainient
                    color1="#1A1919"
                    color2="#0d7000"
                    color3="#00556e"
                    timeSpeed={0.25}
                    colorBalance={0}
                    warpStrength={1}
                    warpFrequency={5}
                    warpSpeed={2}
                    warpAmplitude={50}
                    blendAngle={0}
                    blendSoftness={0.05}
                    rotationAmount={500}
                    noiseScale={2}
                    grainAmount={0.1}
                    grainScale={2}
                    grainAnimated={false}
                    contrast={1.5}
                    gamma={1}
                    saturation={1}
                    centerX={0}
                    centerY={0}
                    zoom={0.9}
                />
            </div>

            {/* Gradual Blur at Top - Fixed */}
                <div style={{ position: 'fixed', height: '120px', overflow: 'hidden', top: 0, left: 0, right: 0, zIndex: 10 }}>
                <GradualBlur
                    target="parent"
                    position="top"
                    height="7rem"
                    strength={4}
                    divCount={5}
                    curve="bezier"
                    exponential
                    opacity={1}
                />
                </div>

            {/* Navbar */}
            <div className="relative w-full flex items-center justify-center" style={{ zIndex: 20 }}>
                <PillNav
                    logo={logo}
                    logoAlt="Company Logo"
                    items={items}
                    activeHref="/"
                    className="custom-nav"
                    ease="power2.easeOut"
                    baseColor="#000000"
                    pillColor="#ffffff"
                    hoveredPillTextColor="#ffffff"
                    pillTextColor="#000000"
                    // theme="light"
                    initialLoadAnimation={false}
                />
            </div>

            {/* Content */}
            <div className="relative mx-4 pt-24">
                <Outlet />
                <Footer />
            </div>
            
        </div>
    )
}

export default UserLayout
import "./styles/Dock.css";
import {
    FaHouse,
    FaUser,
    FaBriefcase,
    FaEnvelope,
} from "react-icons/fa6";

const Dock = () => {
    return (
        <div className="dock-container">
            <div className="dock">
                <a href="#" className="dock-item">
                    <FaHouse />
                    <span className="dock-tooltip">Home</span>
                </a>
                <a href="#about" className="dock-item">
                    <FaUser />
                    <span className="dock-tooltip">About</span>
                </a>
                <a href="#work" className="dock-item">
                    <FaBriefcase />
                    <span className="dock-tooltip">Work</span>
                </a>
                <a href="#contact" className="dock-item">
                    <FaEnvelope />
                    <span className="dock-tooltip">Contact</span>
                </a>
            </div>
        </div>
    );
};

export default Dock;

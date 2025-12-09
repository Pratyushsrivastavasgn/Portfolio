import "./styles/About.css";
import { config } from "../config";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{config.about.title}</h3>
        {config.about.description.map((desc, index) => (
          <p key={index} className="para" style={{ marginBottom: "20px" }}>
            {desc}
          </p>
        ))}
      </div>
    </div>
  );
};

export default About;

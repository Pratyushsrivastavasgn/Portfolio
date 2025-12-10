import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";
import { config } from "../config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { send } from "@emailjs/browser";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const SERVICE_ID = "service_3uedanj";
  const TEMPLATE_ID = "template_vvizrx8";
  const PUBLIC_KEY = "gwBdHBv3CeO4g1fEt";
  console.log('EmailJS env vars:', SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY);
  useEffect(() => {
    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 80%",
        end: "bottom center",
        toggleActions: "play none none none",
      },
    });

    // Animate title from bottom
    contactTimeline.fromTo(
      ".contact-section h3",
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      }
    );

    // Animate contact boxes with stagger from bottom
    contactTimeline.fromTo(
      ".contact-box",
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
      },
      "-=0.4"
    );

    // Clean up
    return () => {
      contactTimeline.kill();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setStatus("error");
      console.warn("EmailJS env variables missing. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY.");
      return;
    }
    const target = formRef.current;
    if (!target) return;
    setStatus("sending");
    const formData = new FormData(target);
    const templateParams: Record<string, any> = {
      from_name: formData.get("name"),
      from_email: formData.get("email"),
      message: formData.get("message"),
    };

    send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => {
        setStatus("success");
        target.reset();
      })
      .catch((err) => {
        console.error("EmailJS send error:", err);
        setStatus("error");
      });
  };

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>{config.developer.fullName}</h3>
        <div className="social-top-right">
          <a
            href={config.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="disable"
            className="contact-social"
          >
            Github <MdArrowOutward />
          </a>
          <a
            href={config.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="disable"
            className="contact-social"
          >
            Linkedin <MdArrowOutward />
          </a>
          <a
            href={config.contact.twitter}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="disable"
            className="contact-social"
          >
            Twitter <MdArrowOutward />
          </a>
          <a
            href={config.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="disable"
            className="contact-social"
          >
            Instagram <MdArrowOutward />
          </a>
        </div>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href={`mailto:${config.contact.email}`} data-cursor="disable">
                {config.contact.email}
              </a>
            </p>
            <h4>Location</h4>
            <p>
              <span>{config.social.location}</span>
            </p>
          </div>
          <div className="contact-box contact-form-box">
            <h4>Contact Me</h4>
            <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
              <input name="name" type="text" placeholder="Your name" required />
              <input name="email" type="email" placeholder="Your email" required />
              <textarea name="message" placeholder="Your message" rows={4} required />
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={status === "sending"}>
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
                {status === "success" && <span className="form-success">Message sent 🎉</span>}
                {status === "error" && <span className="form-error">Sending failed. Check console.</span>}
              </div>
              {!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY ? (
                <p className="form-note">EmailJS is not configured. Set VITE_EMAILJS_* env variables.</p>
              ) : null}
            </form>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>{config.developer.fullName}</span>
            </h2>
            <h5>
              <MdCopyright /> {new Date().getFullYear()}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import { useEffect, useRef, useState, type FormEvent } from "react";

import { createRevealAnimation } from "../../lib/animation/factories";
import { Icon } from "./Icon";

export function Newsletter() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const targets = section.querySelectorAll("[data-reveal]");
    const anim = createRevealAnimation(section, targets, { y: 34, stagger: 0.08 });
    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sent");
  }

  return (
    <section className="newsletter" ref={sectionRef} id="contacto">
      <div className="container newsletter__inner">
        <span className="newsletter__icon" data-reveal>
          <Icon name="sparks" size={26} strokeWidth={1.3} />
        </span>
        <h2 className="newsletter__title" data-reveal>
          Únete al
          <br />
          underground.
        </h2>
        <p className="newsletter__copy" data-reveal>
          Acceso anticipado a lanzamientos, restocks limitados y drops que no
          se anuncian en ningún otro lado.
        </p>

        <form className="newsletter__form" data-reveal onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            aria-label="Correo electrónico"
            disabled={status === "sent"}
          />
          <button type="submit" className="pill-btn pill-btn--solid" disabled={status === "sent"}>
            {status === "sent" ? "Listo, ya estás dentro" : "Suscribirme"}
            <Icon name="arrowUpRight" size={14} />
          </button>
        </form>
      </div>
    </section>
  );
}

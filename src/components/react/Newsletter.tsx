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
          Contact the
          <br />
          student store.
        </h2>
        <p className="newsletter__copy" data-reveal>
          The store's email is hello@larperchlothes.mx. The owner's phone is
          +52 998 123 4567. Send us a message about an item's size, condition,
          or campus delivery.
        </p>

        <form className="newsletter__form" data-reveal onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="your@email.com"
            aria-label="Email address"
            disabled={status === "sent"}
          />
          <button type="submit" className="pill-btn pill-btn--solid" disabled={status === "sent"}>
            {status === "sent" ? "Message received" : "Send a request"}
            <Icon name="arrowUpRight" size={14} />
          </button>
        </form>
      </div>
    </section>
  );
}

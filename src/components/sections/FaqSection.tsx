import { Plus } from "lucide-react";
import { FAQ } from "@/lib/faq";
import SectionHead from "./SectionHead";

/** Section « FAQ » : questions dépliables (balise details, sans JavaScript). */
export default function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-titre"
      className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHead
          path="/faq"
          id="faq-titre"
          title={
            <>
              Questions <span className="text-glow">fréquentes</span>
            </>
          }
        />
        <div className="max-w-[820px] border-t border-white/10">
          {FAQ.map((item, i) => (
            <details key={item.question} open={i === 0} className="group border-b border-white/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-[family-name:var(--font-display)] text-[1.08rem] font-semibold leading-snug [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {item.question}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-accent-strong transition-transform duration-300 group-open:rotate-45">
                  <Plus size={16} aria-hidden />
                </span>
              </summary>
              <p className="max-w-[64ch] pb-6 text-[15.5px] leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

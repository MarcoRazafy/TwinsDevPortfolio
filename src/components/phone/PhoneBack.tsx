/** Face arrière : aluminium orange, fenêtre en verre, logo. Le plateau caméra est un volume séparé. */
export default function PhoneBack() {
  return (
    <div className="absolute inset-0 rounded-[3.3rem] bg-[linear-gradient(160deg,#4a7a5c_0%,#2b5a3f_30%,#1e4530_65%,#11301f_100%)] p-[4px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.35)]">
      <div className="relative h-full w-full overflow-hidden rounded-[3.05rem] bg-[linear-gradient(170deg,#3a6a4c_0%,#26533a_45%,#1b4029_100%)]">
        {/* Grain anodisé */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Fenêtre en verre avec le logo */}
        <div className="absolute inset-x-[5%] bottom-[3.5%] top-[33.5%] flex items-center justify-center rounded-[1.9rem] bg-[linear-gradient(180deg,#3f7354_0%,#2c5b40_55%,#224a34_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28),inset_0_-2px_6px_rgba(0,0,0,0.18)]">
          {/* Logo ton sur ton : la silhouette du monogramme TD sert de masque à un vert plus sombre */}
          <span
            aria-hidden
            className="h-16 w-[75px] bg-[linear-gradient(170deg,#1a4a30_0%,#0d2b1b_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
            style={{
              WebkitMaskImage: "url(/brand/twinsdev-mark.webp)",
              maskImage: "url(/brand/twinsdev-mark.webp)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </div>
      </div>
    </div>
  );
}

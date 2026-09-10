import Image from "next/image";

export function EditorialHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return (
    <section className="relative mb-6 min-h-[310px] overflow-hidden rounded-[34px] bg-[#e9eef5] px-7 py-9 sm:px-10 md:min-h-[350px] md:py-12">
      <Image src="/images/device-collection-hero.png" alt="An original collection of modern retail technology devices" fill priority sizes="(max-width: 1240px) 100vw, 1184px" className="object-cover object-[62%_center]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(239,243,248,.98)_0%,rgba(239,243,248,.91)_38%,rgba(239,243,248,.2)_68%,rgba(239,243,248,0)_100%)]" />
      <div className="relative z-10 flex min-h-[238px] max-w-[520px] flex-col justify-center md:min-h-[254px]">
        <p className="text-[12px] font-semibold tracking-[-0.01em] text-[#0071e3]">{eyebrow}</p>
        <h1 className="mt-2 text-[38px] font-semibold leading-[1.03] tracking-[-0.05em] text-[#1d1d1f] sm:text-[48px] md:text-[56px]">{title}</h1>
        <p className="mt-4 max-w-[430px] text-[15px] leading-6 text-[#515154] md:text-[17px]">{description}</p>
        {children && <div className="mt-6 max-w-[390px]">{children}</div>}
      </div>
    </section>
  );
}

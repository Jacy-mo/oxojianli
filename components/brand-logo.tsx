export function BrandLogo() {
  return (
    <div className="flex items-center gap-3" aria-label="oxo简历">
      <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-ink shadow-sm">
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          role="img"
          aria-label="oxo logo"
        >
          <circle cx="8" cy="15" r="5.3" stroke="#ffffff" strokeWidth="2.7" />
          <circle cx="22" cy="15" r="5.3" stroke="#ffffff" strokeWidth="2.7" />
          <path d="M12.4 9.4L17.6 20.6" stroke="#12b8ad" strokeWidth="3" strokeLinecap="round" />
          <path d="M17.6 9.4L12.4 20.6" stroke="#12b8ad" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="text-[28px] font-black tracking-normal text-ink">oxo简历</div>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
          Resume Studio
        </div>
      </div>
    </div>
  )
}

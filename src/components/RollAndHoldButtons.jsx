export default function RollAndHoldButtons({
  onRoll,
  onHold,
  isRolling,
  disabled,
}) {
  return (
    <>
      {!isRolling && (
        <div className="flex gap-6">
          {/* ROLL DICE BUTTON */}
          <button className="group relative">
            {/* The Shadow Layer */}
            <div className="rounded-xl translate-x-1 translate-y-1" />
            {/* The Button Body */}

            <div
              onClick={onRoll}
              className="relative bg-yellow-400 px-6 py-3 rounded-xl uppercase text-sm
                    transition-transform active:translate-x-1 active:translate-y-1"
            >
              <span className="flex items-center gap-2 tracking-wide font-semibold">
                🎲
                <br /> Roll Dice
              </span>
            </div>
          </button>

          {/* HOLD RESULT BUTTON */}
          <button className="group relative">
            {/* The Shadow Layer */}
            <div className="rounded-xl translate-x-1 translate-y-1" />
            {/* The Button Body */}
            <div
              onClick={onHold}
              className="relative bg-purple-100 px-6 py-3 rounded-xl uppercase tracking-tighter text-sm
                    transition-transform active:translate-x-1 active:translate-y-1"
            >
              <span className="flex items-center gap-2 text-black tracking-wide font-semibold">
                📥
                <br /> Hold Result
              </span>
            </div>
          </button>
        </div>
      )}
    </>
  );
}

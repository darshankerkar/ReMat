import EwasteChatbot from "../components/EwasteChatbot";

export default function UserChat() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-300/80">
          ReMat assistant
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">How can I help?</h1>
        <p className="mt-2 text-white/60">
          Get simple answers about recycling electronics and using ReMat.
        </p>
      </div>
      <EwasteChatbot />
    </main>
  );
}

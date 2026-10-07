/* Competition rules. PLACEHOLDER — the real rules come from Monika (CX owns
   rules and judging) and need legal review before launch. The structure below
   mirrors the Pi Day terms page; every value in [brackets] is unconfirmed. */
export function Terms() {
  return (
    <main className="fw-terms">
      <div className="fw-terms-inner">
        <span className="section-eyebrow">Founders Week</span>
        <h1 className="fw-terms-h1">Competition Rules</h1>
        <p className="fw-terms-draft">Draft. These rules are a placeholder and are not final.</p>

        <h2>1. Who can enter</h2>
        <p>
          The competition is open to anyone with a Bolt account who is [18 or older and a resident of an eligible country].
          Employees of StackBlitz and their immediate families cannot enter.
        </p>

        <h2>2. How to enter</h2>
        <p>
          Submit one product built in Bolt through the entry form on the Founders Week page between [Oct 13] and
          [11:59pm PT on Sat Oct 24, 2026]. The product must be live at the link you submit. Products you built before
          Founders Week are eligible.
        </p>

        <h2>3. Judging</h2>
        <p>
          A panel from the Bolt team judges entries on [what the product does for its users, how well it is built, and its
          potential]. Winners are picked the week after entries close.
        </p>

        <h2>4. Prizes</h2>
        <p>
          [1st place $10,000, 2nd place $5,000, 3rd place $3,000, plus Bolt credits, founder merch and, for 1st place, a 1:1
          mentoring session with Eric.] Prizes are not transferable. Submitting a product does not guarantee a prize.
        </p>

        <h2>5. Your entry</h2>
        <p>
          You keep ownership of your product. By entering you allow Bolt to show your product name, description, link and
          name on the Founders Week page and on Bolt's social channels.
        </p>

        <h2>6. Contact</h2>
        <p>Questions about the competition: [contact address].</p>

        <a className="fw-text-link fw-terms-back" href="/">
          Back to Founders Week <i className="fw-arrow" aria-hidden="true" />
        </a>
      </div>
    </main>
  );
}

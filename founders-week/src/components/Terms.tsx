/* Official contest rules — legal's text, verbatim. Do not edit the wording
   here; changes come from legal. Bracketed values ([00:00 a.m.], [sixty (60)]
   …) are legal's own open items and are reproduced as written. */
const TOC: [string, string][] = [
  ['contest-period', 'Contest Period'],
  ['the-contest-is-open-to', 'Who can enter'],
  ['project-requirements', 'Project Requirements'],
  ['how-to-enter', 'How to Enter'],
  ['the-contest-is-not-open-to', 'Who can’t enter'],
  ['intellectual-property-and-property-rights', 'Intellectual Property'],
  ['judging', 'Judging'],
  ['prizes', 'Prizes'],
  ['winner-notification-and-verification', 'Winner Verification'],
  ['taxes', 'Taxes'],
  ['general-conditions', 'General Conditions'],
  ['release-indemnity-limitation-of-liability', 'Release and Liability'],
  ['privacy', 'Privacy'],
  ['governing-law-and-disputes', 'Governing Law and Disputes'],
  ['winners-list', 'Winners List'],
];

export function Terms() {
  return (
    <main className="fw-terms">
      <header className="fw-terms-head">
        <span className="section-eyebrow">Founders Week · Official Rules</span>
        <h1 className="fw-terms-h1">Bolt’s Founders Week Contest Terms and Conditions</h1>
        <dl className="fw-terms-facts">
          <div><dt>Submissions</dt><dd>Oct 13 – Oct 20, 2026</dd></div>
          <div><dt>Judging</dt><dd>Oct 21 – Oct 31, 2026</dd></div>
          <div><dt>Prizes</dt><dd>$17,500 total</dd></div>
          <div><dt>Sponsor</dt><dd>StackBlitz, Inc.</dd></div>
        </dl>
      </header>
      <div className="fw-terms-layout">
        <nav className="fw-terms-toc" aria-label="On this page">
          <span className="fw-terms-toc-label">On this page</span>
          <ol>
            {TOC.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>
      <article className="fw-terms-body">

        <p className="fw-terms-notice">
          NO PURCHASE OR PAYMENT OF ANY KIND IS NECESSARY TO ENTER OR WIN. A PURCHASE OR PAID SUBSCRIPTION WILL NOT IMPROVE
          AN ENTRANT’S SCORE OR CHANCES OF WINNING. THIS IS A CONTEST OF SKILL. VOID WHERE PROHIBITED OR RESTRICTED BY LAW.
        </p>

        <p>
          These Official Rules (the “Rules”) govern the BOLT’S FOUNDERS WEEK CONTEST (the “Contest”). The Contest is
          sponsored by StackBlitz, Inc., 1160 Battery Street, Suite 30W, San Francisco, CA 94111 (“Sponsor”), the operator
          of Bolt.new (“Bolt”). The Contest is administered by StackBlitz, Inc. (“Administrator”). By submitting an entry,
          each Entrant (and, for a Team or Organization, its Representative on its behalf) agrees to these Rules and to the
          decisions of Sponsor and the Judges, which are final and binding on all matters relating to the Contest.
        </p>
        <p>
          Use of Bolt is subject to the Bolt Terms of Service, Privacy Policy, and Acceptable Use Policy (collectively, the
          “Bolt Terms”). As to the Contest, if these Rules conflict with the Bolt Terms, these Rules control.
        </p>

        <h2 id="contest-period">Contest Period</h2>
        <p>
          The Contest begins at [00:00 a.m.] Pacific Time (“PT”) on October 13, 2026 and ends at [23:59 p.m.] PT on October
          20, 2026 (the “Submission Period”). Judging will take place from approximately October 21 to October 31, 2026 (the
          “Judging Period”), and winners will be announced on or about October 31, 2026. Sponsor’s clock is the official
          timekeeping device for the Contest.
        </p>

        <h2 id="the-contest-is-open-to">The Contest IS open to:</h2>
        <ul>
          <li>
            Individuals who are at least eighteen (18) years of age and the age of majority where they reside as of the time
            of entry ("Eligible Individuals");
          </li>
          <li>Teams of Eligible Individuals ("Teams"); and</li>
          <li>
            Organizations (including corporations, not-for-profit corporations and other nonprofit organizations, limited
            liability companies, partnerships, and other legal entities) that exist and have been organized or incorporated
            at the time of entry.
          </li>
        </ul>
        <p>
          (the above, to the extent not excluded under “The Contest IS NOT open to” below, are collectively, "Entrants")
        </p>
        <p>
          Each Eligible Individual entering the Contest, including each member of a Team and each Representative, must have
          a Bolt account in good standing that complies with the Bolt Terms throughout the Contest. Bolt’s free plan may be
          used to enter. No paid subscription, token purchase, or other payment is required to participate, and use of a
          paid plan or additional tokens will not be considered in judging.
        </p>
        <p>
          If an Entrant is employed by, or is an official of, a government entity or public international organization, or
          is subject to employer or other policies that restrict participation in contests or the acceptance of prizes, the
          Entrant is solely responsible for complying with those rules and policies and represents that its participation
          is permitted. Sponsor may disqualify any Entrant whose participation or receipt of a prize would violate any such
          rule or policy or any applicable anti-corruption law.
        </p>
        <p>
          An Eligible Individual may only use one (1) account per platform, tool, or service in relation to this contest.
          This means individuals cannot create multiple accounts to submit multiple submissions from different accounts.
          Doing so may result in disqualification of all associated Submissions and removal from the contest. Each Entrant
          may submit up to one (1) Submission. If an Entrant submits more than the permitted number, only the first eligible
          Submission(s) received will be judged.
        </p>
        <p>
          An Eligible Individual may join more than one Team or Organization and an Eligible Individual who is part of a
          Team or Organization may also enter the contest on an individual basis. If a Team or Organization is entering the
          contest, they must appoint and authorize one individual (the "Representative") to represent, act, and enter a
          Submission, on their behalf. By entering a Submission on behalf of a Team or Organization you represent and
          warrant that you are the Representative authorized to act on behalf of your Team or Organization. Each member of a
          Team, and each Representative, must be an Eligible Individual who is not excluded under these Rules. Any prize
          awarded to a Team or Organization will be delivered to its Representative (or, for an Organization, to the
          Organization), who is solely responsible for any distribution among Team members. Sponsor is not responsible for,
          and will not intervene in, any dispute among Team members or within an Organization regarding a Submission or
          prize.
        </p>

        <h2 id="project-requirements">Project Requirements</h2>
        <p>
          <strong>What to Create:</strong> Entrants must build a new application, created during the Submission Period,
          primarily with Bolt.new (each a "Project"). The Project can be built completely with Bolt.new or significantly
          started on Bolt.new as determined by Sponsor, in its sole discretion. A Project may not be a copy, fork, or remix of
          an existing project, including another Entrant’s project or a public Bolt project, except that starter templates
          made available within Bolt may be used as a starting point.
        </p>
        <p>
          While Sponsor recognizes that not every part of the development process may be ideally suited to Bolt, the core
          functionality and final experience must run within Bolt. A light degree of flexibility is allowed, but the focus
          must remain on showcasing Bolt as the primary platform.
        </p>
        <p>
          <strong>What This Means:</strong>
        </p>
        <ul>
          <li>
            <strong>Primary Development in Bolt:</strong> The initial structure and main development must begin in
            Bolt.new. Projects must demonstrate meaningful use of Bolt's capabilities and their core functionality must run
            within the Bolt environment.
          </li>
          <li>
            <strong>External Tools (Allowed in Support Roles):</strong> Tools like Figma, ChatGPT, and other AI/code
            assistants may be used for idea development, design, prototyping, or generating isolated code snippets. Use of
            other platforms is permitted only in areas where Bolt is currently less suited; such use must be kept minimal and
            must be disclosed in the Submission description. Use of any third-party tool, platform, API, or content is
            subject to its own terms; the Entrant is responsible for complying with those terms and for obtaining any rights
            needed to include the resulting output in the Submission.
          </li>
          <li>
            <strong>Project Review &amp; Evaluation:</strong> As reflected in the Judging Criteria below, judging will favor
            submissions that are clearly and primarily built on Bolt. Creative use of Bolt is encouraged, but the project
            should still be a representative example of what Bolt can do today. Sponsor may disqualify any Project that does
            not satisfy these Project Requirements.
          </li>
        </ul>

        <h2 id="how-to-enter">How to Enter</h2>
        <p>
          To enter, during the Submission Period the Entrant (or its Representative) must visit{' '}
          <a href="https://bolt.new/founders-week">https://bolt.new/founders-week</a> and complete the entry form] and
          submit all of the following (collectively, a “Submission”): (a) a link to the working Project that is publicly
          accessible, free of charge, and functional for judging and testing through the end of the Judging Period; (b) a
          written description of the Project and its features, including disclosure of any external tools, platforms, or
          third-party content used, as required above; (c) a demonstration video of no more than five (5) minutes, uploaded
          to YouTube or X and publicly visible, that shows the Project functioning; and (d) the Bolt project link and any
          other required materials.
        </p>
        <p>
          Submissions must be in English (or include an English translation) and must comply with the Bolt Acceptable Use
          Policy. Submissions may not contain content that is defamatory, obscene, hateful, harassing, discriminatory,
          deceptive, or unlawful, or third-party trademarks or logos used without permission (other than accurate references
          to tools used). Submissions may not be modified after the Submission Period ends, except as needed to keep the
          Project accessible and functional. Sponsor is not responsible for late, lost, incomplete, corrupted, or misdirected
          Submissions. Submissions received after the Submission Period ends will not be judged.
        </p>

        <h2 id="the-contest-is-not-open-to">The Contest IS NOT open to:</h2>
        <ul>
          <li>
            Individuals who are residents of, or Organizations domiciled in, a country, state, province or territory where
            the laws of the United States or local law prohibits participating or receiving a prize in the contest
            (including, but not limited to, Brazil, China, Crimea, the so-called Donetsk People’s Republic and Luhansk
            People’s Republic regions of Ukraine, Cuba, Iran, North Korea, Quebec, Russia, Syria and any other country or
            region subject to comprehensive U.S. sanctions administered by the U.S. Department of the Treasury’s Office of
            Foreign Assets Control).
          </li>
          <li>
            Individuals and Organizations that are identified on the Specially Designated Nationals and Blocked Persons List
            maintained by the Office of Foreign Assets Control or any other U.S. government restricted-party list, or that
            are owned or controlled by any such person.
          </li>
          <li>
            Organizations involved with the design, production, paid promotion, execution, or distribution of the contest,
            including the Sponsor and Administrator ("Promotion Entities").
          </li>
          <li>
            Employees, representatives and agents** of such Promotion Entities, and all members of their immediate family or
            household.*
          </li>
          <li>
            Any other individual involved with the design, production, promotion, execution, or distribution of the contest,
            and each member of their immediate family or household.*
          </li>
          <li>Any Judge (defined below), or company or individual that employs a Judge.</li>
          <li>Any parent company, subsidiary, or other affiliate*** of any organization described above.</li>
          <li>
            Any other individual or organization whose participation in the contest would create, in the sole discretion of
            the Sponsor and/or Administrator, a real or apparent conflict of interest.
          </li>
        </ul>
        <p className="fw-terms-note">
          *The members of an individual's immediate family include the individual's spouse, children and stepchildren,
          parents and stepparents, and siblings and stepsiblings. The members of an individual's household include any other
          person that shares the same residence as the individual for at least three (3) months out of the year.
        </p>
        <p className="fw-terms-note">
          **Agents include individuals or organizations that in creating a Submission to the contest, are acting on behalf
          of, and at the direction of, a Promotion Entity through a contractual or similar relationship.
        </p>
        <p className="fw-terms-note">
          ***An affiliate is: (a) an organization that is under common control, sharing a common majority or controlling
          owner, or common management; or (b) an organization that has a substantial ownership in, or is substantially owned
          by the other organization.
        </p>

        <h2 id="intellectual-property-and-property-rights">Intellectual Property and Property Rights</h2>
        <p>
          Your Submission must: (a) be your (or your Team’s, or Organization's) original work product, which for this
          purpose includes output generated at your direction using Bolt or other tools permitted by these Rules; (b) be
          owned by, or validly licensed to, you, your Team, or your Organization, with no other person or entity having any
          right or interest in it that conflicts with the rights granted in these Rules; and (c) not violate the
          intellectual property rights or other rights including but not limited to copyright, trademark, patent, contract,
          and/or privacy rights, of any other person or entity. An Entrant may contract with a third party for technical
          assistance to create the Submission provided the Submission components are solely the Entrant's work product and
          the result of the Entrant's ideas and creativity, and the Entrant owns all rights to them. An Entrant may submit a
          Submission that includes the use of open source software or hardware, provided the Entrant complies with
          applicable open source licenses and, as part of the Submission, creates software that enhances and builds upon the
          features and functionality included in the underlying open source product. Because AI-generated output may
          resemble output generated for others, similarity arising solely from the use of Bolt or other permitted AI tools
          will not by itself result in disqualification. By entering the contest, you represent, warrant, and agree that
          your Submission meets these requirements.
        </p>
        <p>
          As between Entrant and Sponsor, Entrant retains all rights it holds in its Submission, subject to the Bolt Terms
          and the license below. By submitting an entry, entrants grant the Sponsor a fully paid, royalty-free, worldwide,
          non-exclusive, perpetual, irrevocable license, sublicensable to Administrator, the Judges, and Sponsor’s service
          providers, to use, reproduce, display, distribute, excerpt, adapt (solely for formatting, length, and translation),
          and publicly perform the Submission (including its name, description, screenshots, video, and any other Submission
          materials) for the purposes of judging the entry and in any materials marketing, advertising, promoting or
          publicizing the contest, its results, the Sponsor, or the Sponsor's products and services, in any media now known
          or later developed. Entrants further agree that the Sponsor shall have the right to use the name, username,
          likeness, voice, image, and biographical information of all individuals contributing to a Submission, as they
          appear in the Submission or as provided to Sponsor, in materials publicizing the contest and its results, without
          further notice, review, or compensation, except where prohibited by law, and represent and warrant that they have
          obtained any consent required from those individuals for such use. Some Submission components may be displayed to
          the public. Other Submission materials may be viewed by the Sponsor and judges for screening and evaluation. By
          submitting an entry or accepting any prize, entrants represent and warrant that (a) submitted content does not
          infringe or misappropriate any third party’s copyright, trade secret, or other intellectual property or
          proprietary rights, including privacy and publicity rights, and entrant owns or has obtained all rights and
          permissions necessary to submit it and grant the licenses in these Rules; (b) the content submitted does not
          contain any viruses, Trojan horses, worms, spyware or other disabling devices or harmful or malicious code; and (c)
          any Project that collects or processes personal information does so in compliance with applicable law.
        </p>
        <p>
          <strong>No Confidentiality; Independent Development.</strong> Submissions are not confidential. Sponsor and its
          affiliates develop products and features, including AI features and templates, and may receive ideas and
          Submissions similar to an Entrant’s. Nothing in these Rules prevents Sponsor from independently developing,
          acquiring, or using similar ideas, concepts, or products without obligation to any Entrant, and no Entrant is
          entitled to compensation for any such similarity.
        </p>
        <p>
          <strong>Relationship to the Bolt Terms.</strong> Content an Entrant creates using Bolt, including the Project,
          remains subject to the Bolt Terms, including Sponsor’s rights under the Bolt Terms and any choices the Entrant has
          made under them. Nothing in these Rules expands or limits those rights or choices.
        </p>

        <h2 id="judging">Judging</h2>
        <p>
          Eligible Submissions will be judged by a panel of judges selected by Sponsor, which may include Sponsor employees
          and qualified third-party experts (each, a “Judge”). Sponsor may first screen Submissions for compliance with these
          Rules. Judges will score each eligible Submission on the following criteria (the “Judging Criteria”):
        </p>
        <ol className="fw-terms-criteria">
          <li>
            <strong>Use of Bolt:</strong> the extent to which the Project is built primarily with Bolt and demonstrates
            meaningful and creative use of Bolt’s capabilities (25%);
          </li>
          <li>
            <strong>Idea:</strong> the creativity and originality of the Project (25%);
          </li>
          <li>
            <strong>Implementation and Design:</strong> the functionality, completeness, user experience, and technical
            execution of the Project (25%); and
          </li>
          <li>
            <strong>Potential Impact:</strong> the extent to which the Project could be useful to its intended users (25%).
          </li>
        </ol>
        <p>
          The eligible Submission with the highest total score in each prize category will be the potential winner of that
          prize. In the event of a tie, the tied Submission with the highest score on criterion (1) will prevail. If a tie
          remains, an additional Judge who has not previously scored the tied Submissions will score them on all Judging
          Criteria to break the tie. Winners will not be selected by random drawing or any other element of chance. If
          Sponsor receives no eligible Submissions for a prize category, that prize will not be awarded. Judges’ decisions
          are final and binding.
        </p>

        <h2 id="prizes">Prizes</h2>
        <p>
          Grand Prize (1): $10000 USD. Second Prize (2): $5000 USD. Third Prize (3): 2500 USD. Total ARV of all prizes:
          $17500 USD. Cash prizes will be paid in U.S. dollars by wire transfer, or PayPal within approximately [sixty (60)]
          days after winner verification. Limit one (1) prize per Entrant. Prizes are non-transferable, and no substitution
          or cash equivalent is permitted, except that Sponsor may substitute a prize of equal or greater value if an
          advertised prize becomes unavailable. [Any Bolt subscription or token prizes are subject to the Bolt Terms and have
          no cash value.]
        </p>

        <h2 id="winner-notification-and-verification">Winner Notification and Verification</h2>
        <p>
          Potential winners will be notified by email at the address associated with the Submission. Each potential winner
          (and, for a Team or Organization, its Representative and, on Sponsor’s request, each Team member) must sign and
          return, within ten (10) days after notification, an affidavit of eligibility, a liability release and, where
          lawful, a publicity release, and applicable tax forms. Sponsor may request the Bolt project history or other
          evidence that the Project satisfies the Project Requirements. If a potential winner cannot be contacted, fails to
          return the required documents on time, is found ineligible, or has not complied with these Rules, the prize may be
          forfeited and awarded to the eligible Submission with the next-highest score.
        </p>
        <p>
          Before being confirmed as a winner, any potential winner who is a resident of Canada must correctly answer, without
          assistance, a time-limited mathematical skill-testing question.
        </p>

        <h2 id="taxes">Taxes</h2>
        <p>
          Winners are solely responsible for all taxes, fees, and other costs associated with any prize. U.S. winners must
          provide an IRS Form W-9 and will receive an IRS Form 1099 where required by law. Winners who are not U.S. persons
          must provide the applicable IRS Form W-8, and Sponsor may withhold taxes from any prize as required by applicable
          law or treaty. Sponsor may withhold a prize until all required tax documentation is received.
        </p>

        <h2 id="general-conditions">General Conditions</h2>
        <p>
          Sponsor may disqualify any Entrant who tampers with the entry process or the operation of the Contest, violates
          these Rules or the Bolt Terms, attempts to manipulate judging, or acts in a disruptive or unsportsmanlike manner. If
          the Contest is compromised by fraud, technical failures, or any other cause beyond Sponsor’s reasonable control that
          impairs the integrity or proper functioning of the Contest, Sponsor may, subject to applicable law, cancel,
          suspend, or modify the Contest and, if it does so, will judge eligible Submissions received before the event that
          caused the action. Except as stated in the preceding sentence or required by law, Sponsor will not modify these
          Rules after the Submission Period begins in any way that materially and adversely affects Entrants.
        </p>
        <p>
          The Contest is not sponsored, endorsed, or administered by, or associated with, any social media platform or any
          third-party tool provider referenced in these Rules. Sponsor’s failure to enforce any provision of these Rules is
          not a waiver of that provision. If any provision of these Rules is held invalid, the remaining provisions remain in
          effect.
        </p>

        <h2 id="release-indemnity-limitation-of-liability">Release; Indemnity; Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, each Entrant releases Sponsor, Administrator, the Judges, and their
          respective parents, subsidiaries, affiliates, officers, directors, employees, and agents (the “Released Parties”)
          from all liability, claims, and actions of any kind arising out of or relating to participation in the Contest or
          the acceptance, possession, use, or misuse of any prize. Each Entrant will indemnify the Released Parties against
          any third-party claim arising out of the Entrant’s Submission or breach of these Rules. The Released Parties are not
          responsible for technical, network, or computer malfunctions or errors (including any interruption in or
          unavailability of Bolt), for incorrect or inaccurate entry information, or for typographical errors in any Contest
          materials.
        </p>
        <p>
          EXCEPT WHERE PROHIBITED BY LAW, THE RELEASED PARTIES WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL,
          SPECIAL, OR PUNITIVE DAMAGES ARISING OUT OF THE CONTEST. Nothing in these Rules excludes or limits any liability that
          cannot be excluded or limited under applicable law.
        </p>

        <h2 id="privacy">Privacy</h2>
        <p>
          Personal information collected in connection with the Contest will be processed in accordance with Sponsor’s
          Privacy Policy at{' '}
          <a href="https://stackblitz.com/privacy-policy" target="_blank" rel="noopener">
            stackblitz.com/privacy-policy
          </a>
          . Sponsor uses this information to administer the Contest, verify eligibility, award prizes, comply with legal
          obligations, and publicize the Contest and its results as permitted by these Rules and applicable law.
        </p>

        <h2 id="governing-law-and-disputes">Governing Law and Disputes</h2>
        <p>
          These Rules and the Contest are governed by the laws of the State of California, without regard to its
          conflict-of-laws rules. Any dispute arising out of or relating to the Contest or these Rules will be resolved in
          accordance with the dispute resolution provisions of the Bolt Terms, including the agreement to arbitrate on an
          individual basis and the class action waiver, which are incorporated into these Rules by reference.
        </p>

        <h2 id="winners-list">Winners List</h2>
        <p>
          To obtain the names of the winners, <a href="https://bolt.new/founders-week">https://bolt.new/founders-week</a> or
          send a request, within ninety (90) days after winners are announced, to{' '}
          <a href="mailto:legal@stackblitz.com">legal@stackblitz.com</a> with the subject line “Bolt’s Founders Week Contest
          Winners List.”
        </p>

        <a className="fw-text-link fw-terms-back" href="/">
          Back to Founders Week <i className="fw-arrow" aria-hidden="true" />
        </a>
      </article>
      </div>
    </main>
  );
}

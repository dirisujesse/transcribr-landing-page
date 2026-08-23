---
title: "What we shipped this summer, and what we learned"
description: "Word export, search across your whole library, a real caption editor, and a redaction tool that catches what documents actually leak. Plus the transcription failures we spent August hunting down."
publishDate: 2026-08-24
tags: ["product", "privacy"]
---

Transcribr has changed a good deal over the past few weeks. Some of it is new
capability, some of it is repair, and the repair is probably the more useful
half. Here is what landed and why.

## Transcription got considerably more reliable

Through the first half of August, too many files failed. Longer recordings were
worst affected, and audio recorded directly in the browser had its own separate
problem. Neither failure was random, which made both findable.

The first was a container problem. Audio recorded in a browser arrives in a
format that our speech model could not always read, and rather than failing
loudly it sometimes produced a partial transcript. The second was subtler: a
long recording could come back looking complete, with a plausible transcript
that simply stopped early. Nothing about the result announced that the last ten
minutes were missing.

That second one is the failure mode worth dwelling on. A transcript that is
obviously broken costs you a retry. A transcript that is quietly incomplete
costs you the thing you were transcribing for, and you may not notice until it
matters. We now measure how much of a recording a transcript actually covers
and reject the ones that fall short, rather than handing you something that
reads fine and is not.

Failures have dropped sharply since the middle of August. If you gave up on a
file that would not process, it is worth another go.

## Export to Word

Transcripts now export as DOCX alongside the existing formats. It turns out
that "send it to me as a Word document" is what most people actually need to do
with a transcript once they have it.

## Search across everything

Search used to filter whatever was already loaded on screen, which meant it
quietly missed anything further down your library. It now runs on the server
across your whole archive. If you have hundreds of transcripts, this is the
change you will feel most.

## Private Studio grew up

Redaction now catches what documents genuinely leak, not just the obvious
identifiers. Names, dates and phone numbers are detected alongside emails and
card numbers, with presets for common obligations including GDPR. Redacted
documents are kept as a list you can review and clear rather than disappearing
after one use.

The important part has not changed: **all of it happens in your browser.** The
files never reach us. That is not a policy we are asking you to trust, it is
where the code runs.

## A real caption editor

Cues are drawn over the audio waveform, stay in sync as you play, and can be
edited directly. Previously you could export captions and hope. Now you can see
where each line sits against the sound and fix the ones that drift.

## Live Notes can listen to a browser tab

Not just your microphone. Useful for calls, recorded talks, and anything else
playing on your screen. It also uses your browser's own summariser where one is
available, and says plainly when it is not, rather than pretending.

## What we are working on next

Two things worth naming. We are moving campaign email onto its own
infrastructure, separate from the transactional messages that carry your
sign-in codes and transcript notifications — so that a marketing problem can
never affect the mail you actually need. And we are continuing to chase the
long tail of transcription failures, particularly on recordings over half an
hour, where there is still more to do.

If something is not working the way you expect, tell us. Most of what is in
this post started with somebody saying so.

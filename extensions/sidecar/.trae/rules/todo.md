---
alwaysApply: false
description:
---
## IMPORTANT
- override the page title to strip "ChatGPT - "
- refresh extension button if its out of sync
- automatically focus the input when focusin the page or clicking on thep age once withou dragging or anything
- css for collapsed code areas on light mode needs to be adjusted to be visible
- adjustment for position of the canvas needs to be more proper.. lets have a debug settign that shows red rectangles around the defined areas that the pets / canvas area can obtain, allow them to overlap.

-- PETS
	- while chat is thinking it keeps resetting the pet frame / view. this is a bug.

-- HANDLE
	- double click handle to toggle llike the button from fixed composer height to dragged height

## NICE TO HAVE
- add an animation to the grab handle that animates in cute like in a way that its super small and sorta just a line that fades out on each end as if it's something and then when you hover over it, it expands to a full size grab handle
- add a transition to the grab handle that animates when you hover over it
- when you press up in the text area in the chatgpt input area it should go through the recent prompts but only a preview with a ... and beside that a character count and soem other data with pressing right arrow to input the entire prompt into the text area
- when you send a prompt i want an option to prevent it scrolling all the way to the bottom
- seems like there is some weird ness with large prompts set and the wide setting where my prompts sent go widly off the left hand of the page
- add option to similar to code boxes collapse all chats but leaving maybe a paragraph of space to preview with the rest beign trimmed with ... and a character count
- add an option to automatically collapse chats when you send a prompt
- add an option to automatically collapse chats when you send a prompt over X characters
- implement visually on messages ive sent around "```" and "```" or soemthing similar code blocks that chat gpt uses when they send code blocks
- implement code highlighting for code blocks i send in the same fashion as chat gpt sends.
- replace all UI with svelte driven precompliled components
- macros store for users to share macro automation scripts that feed into our flow

- click on code blocks and copy the whole block by default as long as the setting is set
- highlighting anything in a conversation box from me or from chat gpt should copy it to clipboard as long as the setting is set


## DONE

- popovers close when you click on them or on any of the controls inside them

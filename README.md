[![Netlify Status](https://api.netlify.com/api/v1/badges/fb453a53-0431-4179-89b7-4ebda15c434e/deploy-status)](https://app.netlify.com/sites/thumb-codes/deploys) https://thumb.codes

# Thumb Codes

Emoji clipboard: from search term to clipboard without using your mouse

## Why

The alternatives I've found (emojipedia, amp-what.com, and other unicode/emoji
searches) are optimized for discovery. I wanted one optimized for putting the
emoji on my clipboard ASAP, and I wanted a quick+fun side project.

## Contributing

PRs welcome, as long as you don't make it any more keystrokes to get an emoji
onto the clipboard :)

## Developer Notes

### Running locally

    npm run watch

### Updating the emoji list

Manually find the unicode emoji test document, e.g. https://unicode.org/Public/emoji/13.0/emoji-test.txt

Download save it in ./source.txt

Then re-run `npm run build`



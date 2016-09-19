# InDesign Cleanup

1. [Export InDesign files to HTML](https://helpx.adobe.com/indesign/using/export-content-html-cc.html)
2. Place the HTML output files in the `./indesign/src` directory. These files won't be modified.
3. Run the inflect task in the command line.
    ```bash
    $ gulp inflect
    ```
    This will output cleaned files to `./indesign/cleaned`
4. [optionally]

## inflect

The IDPF defines [semantic inflection](http://www.idpf.org/epub/301/spec/epub-contentdocs.html#sec-xhtml-semantic-inflection) as "the process of attaching additional meaning" to a document. The inflect.js gulp task takes a semantic map and uses it to add microdata, change non-semantic elements to more semantic ones, or remove meaningless tags.

```bash
$ gulp inflect
```

By default, the inflect Gulp task will use `./_inflect.json` as the semantic map.The inflect Gulp task uses `document.querySelectorAll()` to find all elements matching the given selector, and will either change the tag to the given html element, add additional semantic information based on the vocabulary given, or remove the element entirely, replacing it with its children.

| Key | Description | Type |
|----|----|----|
| `selector` (required) | Any valid CSS selector | `string` |
| `html` | Any valid HTML element | `string` |
| `remove` | Remove the given selector, but keep its children | `boolean` |
| `epub-type` | Any valid [epub:type](https://idpf.github.io/epub-vocabs/structure/) attribute | `string` |
| `dpub` | Any valid [DPUB ARIA role](https://www.w3.org/TR/dpub-aria-1.0/) | `string` |

## Examples

### Applying Style Maps After InDesign Export
If [style maps](http://www.adobe.com/in/accessibility/products/indesign/mapping.html) aren't created prior to InDesign export, elements with the `A-HEAD` class will simply be output as `<p class="A-HEAD">...</p>` elements. The following map would turn all `.A-HEAD` elements into semantic `<h1>` tags.
* Map
    ```javascript
    [{
        "selector": ".A-HEAD",
        "html": "h1",
        "epub-type": "title"
    }]
    ```
* Input
    ```html
    <p class="A-HEAD">Lorem ipsum dolor sit amet</p>
    ```
* Output
    ```html
    <h1 class="A-HEAD" epub:type="title">Lorem ipsum dolor sit amet</h1>
    ```
### Removing Useless Containers
InDesign often outputs generated containers with a generated id that begins with "_id".
* Map
    ```javascript
    [{
        "selector": "[id^=_id]",    // id begins with "_id"
        "remove": "true"
    }]
    ```
* Input
    ```html
    <div id="_idContainer003">
        <p class="CT">Lorem ipsum dolor sit amet...</p>
    </div>
    ```
* Output
    ```html
    <p class="CT">Lorem ipsum dolor sit amet...</p>
    ```

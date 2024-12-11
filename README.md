# intl-ordinal

[![npm](https://img.shields.io/npm/v/intl-ordinal?logo=npm&logoColor=%23CB3837&label=npm&labelColor=white&color=%23CB3837)](https://www.npmjs.org/package/intl-ordinal)
[![GitHub](https://img.shields.io/npm/v/intl-ordinal?logo=github&label=GitHub&color=%23181717)](https://github.com/otomad/intl-ordinal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)][license-url]

[license-url]: https://opensource.org/licenses/MIT
[new-issue-url]: https://github.com/otomad/intl-ordinal/issues/new

Internationalization (i18n) to get the ordinal numbers in every languages.

### Example

> #### English:
> 1st, 2nd, 3rd, 4th …
> #### Spanish (male):
> 1.º, 2.º, 3.º …
> #### Spanish (female):
> 1.ª, 2.ª, 3.ª …

### Last index and nth

> #### English:
> last, 2nd to last, 3rd to last …\
> nth, nth to last

## Installation

```bash
# npm
npm install intl-ordinal

# yarn
yarn add intl-ordinal

# pnpm
pnpm add intl-ordinal
```

## Usage

```javascript
import ordinal from "intl-ordinal";

// Get ordinal numbers
console.log(ordinal("en-US").format(3)); // "3rd"
// BigInt
console.log(ordinal("en-US").format(12n)); // "12th"
// With gender (defaults to male)
console.log(ordinal("es-ES").format(5)); // "5.º"
console.log(ordinal("es-ES", { gender = "female" }).format(5)); // "5.ª"
// From last
console.log(ordinal("en-US").format(-1)); // "last"
console.log(ordinal("en-US").format(-128)); // "128th to last"
// nth
console.log(ordinal("en-US").format(Infinity)); // "nth"
console.log(ordinal("en-US").format(-Infinity)); // "nth to last"
console.log(ordinal("de-DE").format(Infinity)); // "x-te"
// Check if the locale is supported\
console.log(ordinal("en-GB").supports); // true
console.log(ordinal("art-x-myownlanguage").supports); // false
```

## License

intl-ordinal is available under the [MIT License][license-url]. See the LICENSE file for more info.

## Supported Languages

If you would like support for other languages, [please submit an issue][new-issue-url].

The resources in the existing languages ​​are obtained through data query, and are not guaranteed to be all correct. [Corrections are welcome][new-issue-url].

<details>
<summary>Supported languages</summary>

- English
- Chinese
- Japanese
- Korean
- Vietnamese
- Indonesian
- Malay
- French
- Spanish
- Portuguese
- Italian
- German
- Russian

</details>

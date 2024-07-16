import { marked } from 'marked'
import { companyName, domain } from '../lib/env'
import Page from './_board.terms'

export default Page

export async function loader() {
    const html = marked(markdown)
    return {
        html,
    }
}

const markdown = `
Privacy Policy
==============

### The Gist

${companyName} will collect certain non-personally identify information about you as you use our sites. We may use this data to better understand our users. We can also publish this data, but the data will be about a large group of users, not individuals.

We will also ask you to provide personal information, but you'll always be able to opt out. If you give us personal information, we won't do anything evil with it.

We can also use cookies, but you can choose not to store these.

That's the basic idea, but you must read through the entire Privacy Policy below and agree with all the details before you use any of our sites.

### Reuse

This document is based upon the [Automattic Privacy Policy](http://automattic.com/privacy/) and is licensed under [Creative Commons Attribution Share-Alike License 2.5](http://creativecommons.org/licenses/by-sa/2.5/). Basically, this means you can use it verbatim or edited, but you must release new versions under the same license and you have to credit Automattic somewhere (like this!). Automattic is not connected with and does not sponsor or endorse ${companyName} or its use of the work.

${companyName}, Inc. ("${companyName}") makes available services include our web sites (${domain} and ${domain}), our blog, our API, and any other software, sites, and services offered by ${companyName} in connection to any of those (taken together, the "Service"). It is ${companyName}'s policy to respect your privacy regarding any information we may collect while operating our websites.

### Questions

If you have question about this Privacy Policy, please contact us at tommy@${domain}

### Visitors

Like most website operators, ${companyName} collects non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request. ${companyName}'s purpose in collecting non-personally identifying information is to better understand how ${companyName}'s visitors use its website. From time to time, ${companyName} may release non-personally-identifying information in the aggregate, e.g., by publishing a report on trends in the usage of its website.

${companyName} also collects potentially personally-identifying information like Internet Protocol (IP) addresses. ${companyName} does not use such information to identify its visitors, however, and does not disclose such information, other than under the same circumstances that it uses and discloses personally-identifying information, as described below. We may also collect and use IP addresses to block users who violated our Terms of Service.

### Gathering of Personally-Identifying Information

Certain visitors to ${companyName}'s websites choose to interact with ${companyName} in ways that require ${companyName} to gather personally-identifying information. The amount and type of information that ${companyName} gathers depends on the nature of the interaction. ${companyName} collects such information only insofar as is necessary or appropriate to fulfill the purpose of the visitor's interaction with ${companyName}. ${companyName} does not disclose personally-identifying information other than as described below. And visitors can always refuse to supply personally-identifying information, with the caveat that it may prevent them from engaging in certain Service-related activities.

Additionally, some interactions, such as posting a comment, may ask for optional personal information. For instance, when posting a comment, may provide a website that will be displayed along with a user's name when the comment is displayed. Supplying such personal information is completely optional and is only displayed for the benefit and the convenience of the user.

### Aggregated Statistics

${companyName} may collect statistics about the behavior of visitors to the Service. For instance, ${companyName} may monitor the most popular parts of the ${domain}. ${companyName} may display this information publicly or provide it to others. However, ${companyName} does not disclose personally-identifying information other than as described below.

### Protection of Certain Personally-Identifying Information

${companyName} discloses potentially personally-identifying and personally-identifying information only to those of its employees, contractors and affiliated organizations that (i) need to know that information in order to process it on ${companyName}'s behalf or to provide services available at ${companyName}'s websites, and (ii) that have agreed not to disclose it to others. Some of those employees, contractors and affiliated organizations may be located outside of your home country; by using the Service, you consent to the transfer of such information to them. ${companyName} will not rent or sell potentially personally-identifying and personally-identifying information to anyone. Other than to its employees, contractors and affiliated organizations, as described above, ${companyName} discloses potentially personally-identifying and personally-identifying information only when required to do so by law, or when ${companyName} believes in good faith that disclosure is reasonably necessary to protect the property or rights of ${companyName}, third parties or the public at large. If you are a registered user of the Service and have supplied your email address, ${companyName} may occasionally send you an email to tell you about new features, solicit your feedback, or just keep you up to date with what's going on with ${companyName} and our products. We primarily use our website and blog to communicate this type of information, so we expect to keep this type of email to a minimum. If you send us a request (for example via a support email or via one of our feedback mechanisms), we reserve the right to publish it in order to help us clarify or respond to your request or to help us support other users. ${companyName} takes all measures reasonably necessary to protect against the unauthorized access, use, alteration or destruction of potentially personally-identifying and personally-identifying information.

### Cookies
A cookie is a string of information that a website stores on a visitor's computer, and that the visitor's browser provides to the Service each time the visitor returns. ${companyName} uses cookies to help ${companyName} identify and track visitors, their usage of ${companyName} Service, and their Service access preferences. ${companyName} visitors who do not wish to have cookies placed on their computers should set their browsers to refuse cookies before using ${companyName}'s websites, with the drawback that certain features of ${companyName}'s websites may not function properly without the aid of cookies.

### Data Storage
${companyName} uses third party vendors and hosting partners to provide the necessary hardware, software, networking, storage, and related technology required to run the Service. You understand that although you retain full rights to your data, it may be stored on third party storage and transmitted through third party networks.

### Privacy Policy Changes
Although most changes are likely to be minor, ${companyName} may change its Privacy Policy from time to time, and in ${companyName}'s sole discretion. ${companyName} encourages visitors to frequently check this page for any changes to its Privacy Policy. Your continued use of this site after any change in this Privacy Policy will constitute your acceptance of such change. 
`

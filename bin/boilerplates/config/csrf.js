/**
 * Cross-Site Request Forgery Protection
 *
 * CSRF tokens are like a tracking chip.  While a session tells the server that a user 
 * "is who they say they are", a csrf token tells the server "you are where you say you are".
 *
 * When enabled, all non-GET requests to the Sails server must be accompanied by 
 * a special token, identified as the '_csrf' parameter.
 *
 * This option protects your Sails app against cross-site request forgery (or CSRF) attacks.
 * A would-be attacker needs not only a user's session cookie, but also this timestamped,
 * secret CSRF token, which is refreshed/granted when the user visits a URL on your app's domain.
 *
 * This allows us to have certainty that our users' requests haven't been hijacked, 
 * and that the requests they're making are intentional and legitimate.
 * 
 * This token has a short-lived expiration timeline, and must be acquired by either:
 *
 * (a)		For traditional view-driven web apps:
 *			Fetching it from one of your views, where it may be accessed as
 *			a local variable, e.g.:
 *			<form>
 *				<input type="hidden" name="_csrf" value="<%= _csrf %>" />
 *			</form>
 * 
 * or (b)	For AJAX/Socket-heavy and/or single-page apps: 
 *			Sending a GET request to the `/csrfToken` route, where it will be returned
 *			as JSON, e.g.:
 *			{ _csrf: 'ajg4JD(JGdajhLJALHDa' }
 *
 *
 * Enabling this option requires managing the token in your front-end app.
 * For traditional web apps, it's as easy as passing the data from a view into a form action.
 * In AJAX/Socket-heavy apps, just send a GET request to the /csrfToken route to get a valid token.
 * 
 * For more information on CSRF, check out:
 * http://en.wikipedia.org/wiki/Cross-site_request_forgery
 */

module.exports.csrf = false;
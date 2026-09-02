# ADR 0004: SSRF Defense-in-Depth for Target URL Inspection

## Status
Accepted

## Context
A11yFix accepts arbitrary public URLs for accessibility analysis. Without rigorous controls, bad actors could submit internal addresses (`http://localhost:3000`, `http://127.0.0.1`, `http://169.254.169.254`, `http://10.0.0.1`, or internal intranet domains) to trigger Server-Side Request Forgery (SSRF), access local services, or harvest cloud instance metadata.

## Decision
We enforce a strict, multi-tiered **Defense-in-Depth SSRF Protection Strategy**:

1. **Protocol Whitelisting**:
   - Only `http:` and `https:` protocols are accepted.
   - Any other URI scheme (`file:`, `ftp:`, `gopher:`, `ws:`, `data:`, `blob:`, etc.) immediately triggers `UnsupportedProtocolError`.

2. **Pre-flight Host & DNS Resolution Validation**:
   - Hostnames are parsed using standard URL parsers.
   - Hostnames must not resolve to:
     - Loopback (`127.0.0.0/8`, `::1`)
     - RFC 1918 Private IPv4 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
     - IPv6 Unique Local (`fc00::/7`) and Link-Local (`fe80::/10`)
     - Link-Local IPv4 (`169.254.0.0/16`, including AWS/GCP/Azure metadata `169.254.169.254`)
     - Broadcast/Multicast (`224.0.0.0/4`, `255.255.255.255/32`)
     - Reserved domains: `*.localhost`, `*.internal`, `*.local`, `*.test`, `*.example`
   - Violations reject the request before any browser process is spawned.

3. **Runtime Browser Redirect Defense**:
   - Playwright route interception monitors HTTP redirects.
   - Every intermediate and target redirect URL is validated against the SSRF policy. If a redirect targets a forbidden host/IP, the request is aborted.

## Consequences
### Positive
- Prevents internal infrastructure reconnaissance and metadata token exfiltration.
- Hardens the system against DNS rebinding and redirection bypasses.

### Negative / Trade-offs
- Prevents testing private staging URLs without an explicit, authenticated proxy or tunneling mechanism (intended design for MVP).

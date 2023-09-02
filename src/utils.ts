const formatHostUri = (loc: Location) => `${loc.protocol}//${loc.host}`;
const formatShareLink = (loc: Location, code: string) => `${formatHostUri(loc)}/s/${code}`;

export { formatHostUri, formatShareLink };

const formatHostUri = (loc: Location) => `${loc.protocol}//${loc.host}`;
const formatShareLink = (loc: Location, code: string) =>
  `${formatHostUri(loc)}/s/${code}`;

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min;
};

export { formatHostUri, formatShareLink, getRandomInt };

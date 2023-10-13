export const isProposalNew = (startDateMs: number) => {
  const now = Date.now() / 1000;
  const startDateSeconds = startDateMs / 1000;

  const diff = now - startDateSeconds;

  console.log("now: ", now)
  console.log("startDate: ", startDateSeconds)
  console.log("diff in isPropnew: ", diff);

  if (diff < 600 && diff > 0) {
    return true;
  } else {
    return false;
  }
}
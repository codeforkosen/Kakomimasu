function sleep(msec: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), msec);
  });
}

function diffTime(unixTime: number) {
  const dt = unixTime * 1000 - new Date().getTime();
  //console.log("diffTime", dt);
  return dt;
}

export { diffTime, sleep };

import React, { useEffect, useState } from "react";
export default function () {
  const [nowTime, setNowTime] = useState(new Date().toLocaleString("ja-JP"));

  useEffect(() => {
    setInterval(() => {
      setNowTime(new Date().toLocaleString("ja-JP"));
    }, 100);
  }, []);

  return (
    <h4>現在時刻：{nowTime}</h4>
  );
}

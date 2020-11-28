import React, { FC, useState, useEffect, HTMLProps } from "react";

// TODO
const config = {
  policyUrl: "http://localhost:8080/policy", // 后端用来获取签名参数的地址
};

interface Props {}
const Index: FC<Props> = ({}) => {
  const [file, setFile] = useState<File | null>(null);
  const [policy, setPolicy] = useState<any>(null);

  useEffect(() => {
    fetch(config.policyUrl)
      .then((res) => res.json())
      .then((data) => {
        setPolicy(data);
      });
  }, []);

  const onChange: HTMLProps<HTMLInputElement>["onChange"] = (ev) => {
    setFile((ev.target as HTMLInputElement).files?.[0] ?? null);
  };

  const submit = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("key", policy.key);
    formData.append("policy", policy.policy);
    formData.append("OSSAccessKeyId", policy.accessid);
    formData.append("success_action_status", "200");
    formData.append("callback", policy.callback);
    formData.append("signature", policy.signature);
    // 采坑：file务必放在最后append，否则后端接收不到callback，真tm恶心，因为这问题排查了好久就说为毛啥都好好的就说不回调呢，艹
    formData.append("file", file);

    fetch(policy.host, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        return res.text();
      })
      .then((res) => {
        console.log(res);
      });
  };

  return (
    <div>
      <input type="file" onChange={onChange} />
      <button onClick={submit}>提交</button>
    </div>
  );
};

export default Index;

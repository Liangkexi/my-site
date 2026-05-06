import Link from "next/link";

export default function NotFound() {
  return (
    <div className="notfound">
      <p className="notfound__code">404</p>
      <h1 className="notfound__title">页面不存在</h1>
      <p className="notfound__desc">你访问的页面已经消失，或者从未存在过。</p>
      <Link href="/" className="notfound__btn">← 回到主页</Link>
    </div>
  );
}

import { Link } from "react-router-dom";

const menu = [
  {
    name: "Pages",
    path: "/pages",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
      </svg>
    )
  },
  {
    name: "Gallery",
    path: "/memories",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4a3 5 0 014 0l4 4m-2-2l1.5-1.5a3 5 0 014 0L20 16M4 6h16M4 6v12h16V6" />
      </svg>
    )
  },
  {
    name: "Settings",
    path: "/settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V3m0 18v-3m9-6h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121m0-12.728l2.121 2.121m8.486 8.486l2.121 2.121" />
      </svg>
    )
  }
];

export default function Sidebar() {
  return (
    <aside>
      {menu.map((item) => (
        <Link key={item.name} to={item.path}>
          {item.icon}
          <span>{item.name}</span>
        </Link>
      ))}
    </aside>
  );
}

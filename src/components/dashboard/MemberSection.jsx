import { IconUser } from "../common/icons";
import "./MemberSection.css";

const MEMBERS = ["Member 1", "Member 2", "Member 3"];

export default function MemberSection({ onMemberSelect }) {
  return <div className="member-section">{MEMBERS.map((name) => <button className="member-tile" key={name} type="button" onClick={() => onMemberSelect(name)}><span className="member-avatar"><IconUser /></span><span className="member-tile-name">{name}</span></button>)}</div>;
}

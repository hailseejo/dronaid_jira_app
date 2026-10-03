import MemberSection from "./MemberSection";

export default function SubsystemOverview({ onMemberSelect }) {
  return <section className="card subsystem-overview"><h1>Sub system Name</h1><MemberSection onMemberSelect={onMemberSelect} /></section>;
}

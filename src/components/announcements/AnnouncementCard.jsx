import { IconArrow, IconMegaphone } from "../common/icons";
import "./AnnouncementCard.css";

export default function AnnouncementCard({ expanded, onToggle }) {
  return <section className="card announcement-card"><div className="side-card-header"><span className="side-card-icon"><IconMegaphone /></span><h2>Announcements</h2></div><button type="button" className="announcement-message" onClick={onToggle} aria-expanded={expanded}><span>Competition subsystem is currently working on</span><IconArrow /></button>{expanded && <p className="announcement-detail">The design review is in progress. The next update is scheduled for 4:00 PM.</p>}</section>;
}

import { OpenInNewTwoTone } from '@mui/icons-material';
import { Link } from '@mui/material';

export type ExternalLinkProps = {
  href: string;
  children?: React.ReactNode;
  inline?: boolean;
};

export default function ExternalLink({ href, children, inline = false }: ExternalLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ display: inline ? 'inline-flex' : 'flex', alignItems: 'center', gap: 0.5 }}
    >
      {children ?? href} <OpenInNewTwoTone fontSize="small" />
    </Link>
  );
}

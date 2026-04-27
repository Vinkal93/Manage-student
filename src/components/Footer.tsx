export default function Footer() {
  return (
    <footer className="mt-8 py-4 border-t border-border text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} All Rights Reserved · Developed by <span className="font-medium text-foreground">Vinkal Prajapati</span>
    </footer>
  );
}

import PersonCommentaryDetail from '@/components/commentary/PersonCommentaryDetail';

interface PersonCommentaryDetailPageProps {
  params: Promise<{
    personCode: string;
  }>;
}

export default async function PersonCommentaryDetailPage({
  params,
}: PersonCommentaryDetailPageProps) {
  const { personCode } = await params;

  return <PersonCommentaryDetail personCode={personCode} />;
}

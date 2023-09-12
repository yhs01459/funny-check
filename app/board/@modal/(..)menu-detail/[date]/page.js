import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { MongoClient } from 'mongodb';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDbUrl } from '@/utils';
import Modal from '@/components/ui/board-modal';
import MenuDetail from '@/components/menu/detail';

async function BoardModal({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in');
  }

  const email = session.user.email;

  const url = getDbUrl();
  const client = await MongoClient.connect(url);

  const db = client.db('funny-check');
  const collection = await db.collection('users');
  const user = await collection.findOne({ email });
  if (!user) {
    client.close();
    return NextResponse.json(
      {
        message: '존재하지 않는 이메일 입니다.',
      },
      { status: 405 }
    );
  }

  const date = params.date;
  const diet = user.diets[date];

  client.close();

  return (
    <Modal date={date}>
      <MenuDetail
        diet={diet ? diet : { breakfast: [], lunch: [], dinner: [] }}
      />
    </Modal>
  );
}

export default BoardModal;

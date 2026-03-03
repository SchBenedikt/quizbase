import { cookies } from 'next/headers';
import { verifySession } from './firebase-admin';

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decodedToken = await verifySession(token);
    return decodedToken;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

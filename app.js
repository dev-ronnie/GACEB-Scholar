const { data: resource, error: insertError } = await db
  .from('resources')
  .insert({
    title: title,
    subject: subject,
    class_level: level,
    description: description || null,
    storage_path: storagePath,
    uploaded_by: user.id,
    status: 'pending',
    access_level: 'free',
    is_downloadable: true,
    coin_price: 0
  })
  .select()
  .single();

if (insertError) {
  console.error('Resource save failed:', insertError.message);
  throw insertError;
}

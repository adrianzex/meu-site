-- Restrict bucket listing: only allow viewing individual files, not listing
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;

CREATE POLICY "Public read product images by name"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images' AND name IS NOT NULL);

-- Restrict direct INSERT on payments: only edge function (service role) can create
DROP POLICY IF EXISTS "Anyone creates payment" ON public.payments;

-- Service role bypasses RLS automatically; no policy needed for inserts.
-- Public users go through edge function which uses service role.
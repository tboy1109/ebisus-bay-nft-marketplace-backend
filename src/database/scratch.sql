
SELECT * 
	FROM listings 
ORDER BY 
	COALESCE(sync_ts, event_ts) DESC

SELECT
	convert(json_extract(json, '$.listingId'), UNSIGNED) as listingId,
	valid,
	convert(json_extract(json, '$.state'), UNSIGNED) as state,
	convert(json_extract(json, '$.nftId'), UNSIGNED) as nftId,
	json_extract(json,'$.is1155') = true as 'is1155',
	json_extract(json,'$.valid') = true as valid,
	convert(json_extract(json, '$.fee'), DECIMAL(16,8)) as fee,
	convert(json_extract(json, '$.royalty'), DECIMAL(16,8)) as royalty,
	convert(json_extract(json, '$.price'), DECIMAL(16,8)) as price,
	REPLACE(json_extract(json, '$.seller'),'\"','') as seller,
	REPLACE(json_extract(json, '$.purchaser'),'\"','') as purchaser,
	REPLACE(json_extract(json, '$.nftAddress'),'\"','') as nft,
	FROM_UNIXTIME(CONVERT(JSON_EXTRACT(JSON, '$.listingTime'), UNSIGNED)) as listingTime,
	FROM_UNIXTIME(CONVERT(JSON_EXTRACT(JSON, '$.saleTime'), UNSIGNED)) as saleTime,
	FROM_UNIXTIME(CONVERT(JSON_EXTRACT(JSON, '$.endingTime'), UNSIGNED)) as endingTime,
    
   sync_cnt, event_cnt, check_cnt, sync_ts, event_ts, check_ts, 
	
	TIMEDIFF(NOW(),FROM_UNIXTIME(check_ts)) AS check_age
FROM 
	listings
ORDER BY
	 COALESCE(sync_ts, event_ts) DESC

SELECT 
	MAX(TIMEDIFF(NOW(),FROM_UNIXTIME(check_ts))) 
FROM 
	listings

SELECT * FROM listings 
WHERE event_cnt > 0 
ORDER BY event_ts desc


SELECT * from listings 
WHERE 
	lower(replace(json_extract(JSON, '$.nftAddress'),'\"','')) 
	IN ('0x939b90c529f0e3a2c187e1b190ca966a95881fde')

UPDATE listings 
SET check_cnt = 0, sync_cnt = 0, event_cnt = 0
WHERE 
	lower(replace(json_extract(JSON, '$.nftAddress'),'\"','')) 
	IN ('0x939b90c529f0e3a2c187e1b190ca966a95881fde')

-- helps figure out bad listings
SELECT MAX(id), json_extract(json, '$.nftAddress') `nftAddress`, group_concat(id) 
FROM listings WHERE json_extract(json, '$.nft') IS NULL
GROUP BY nftAddress
ORDER BY nftAddress asc

-- valid listings per state
SELECT 
	convert(json_extract(json, '$.state'),UNSIGNED) `state`,
	COUNT(*) 
FROM 
	listings 
WHERE 
	invalid IN (0,1)
GROUP BY
	state

select
    id,
    COALESCE(nft.name, nft_ext.name_ext),
    replace(json_extract(json, '$.nftAddress'),'"','') address,
    convert(json_extract(json, '$.nftId'),unsigned) token,
    convert(json_extract(json, '$.state'),unsigned) state,
    convert(json_extract(json, '$.price'),unsigned) price,
    convert(json_extract(json, '$.fee'),unsigned) fee,
    convert(json_extract(json, '$.royalty'),unsigned) royalty,
    convert_tz(FROM_UNIXTIME(event_ts),'GMT','US/Eastern') time
from listings
join nft on (address = replace(lower(json_extract(json, '$.nftAddress')),'"',''))
join nft_ext using (address)
having state = 1
order by event_ts desc;
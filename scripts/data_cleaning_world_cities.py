#Script to remove duplicate cities by converting them to "city, state"

import pandas as pd

df = pd.read_csv('worldcities.csv')
df = df.sort_values('population', ascending=False)

dupes = df[df.duplicated(['city_ascii', 'city'])]
df = df.drop_duplicates(subset = ['city_ascii', 'city'])
dupes = dupes.dropna(subset=['admin_name'])

dupes['city_state'] = dupes['city'] + ', ' + dupes['admin_name']
dupes['city_ascii_state'] = dupes['city_ascii'] + ', ' + dupes['admin_name']

df['city_state'] = None
df['city_ascii_state'] = None

df = pd.concat([df, dupes])

del df['id']
del df['iso2']
del df['capital']
del df['country']

df['c'] = df['city']
df['cs'] = df['city_state']
df['ca'] = df['city_ascii']
df['cas'] = df['city_ascii_state']

del df['city']
del df['city_state']
del df['city_ascii']
del df['city_ascii_state']

df = df.sort_values('population', ascending=True)

df.to_json('world_cities.json', orient='records')
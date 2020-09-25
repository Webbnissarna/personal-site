import os
import subprocess

local_opts = {
    'user': 'root',
    'pass': 'password',
    'host': 'masterkenth-test.com',
    'port': 27017,
    'params': '?authSource=admin'
}

remote_opts = {
    'user': 'root',
    'pass': 'password',
    'host': 'masterkenth.com',
    'port': 27017,
    'params': '?authSource=admin'
}

dbs_to_dump = ['files', 'main']

try:
    os.makedirs('./_dbtemp/backup')
except:
    pass


def make_uri(opts, db):
    return f"mongodb://{opts['user']}:{opts['pass']}@{opts['host']}:{opts['port']}/{db}{opts['params']}"


def make_dump_command(opts, db):
    return ['mongodump', f'--uri="{make_uri(opts, db)}"', f'--archive="./_dbtemp/{db}"']


def make_dump_command2(opts, db):
    return ['mongodump', f'--uri="{make_uri(opts, db)}"', f'--archive="./_dbtemp/backup/{db}"']


def make_drop_command(opts, db):
    return ['mongo', make_uri(opts, db), '--eval', 'db.dropDatabase()']


def make_restore_command(opts, db):
    return ['mongorestore', f'--uri="{make_uri(opts, f"{db}2")}"', f'--archive="./_dbtemp/{db}"']


def run_stages(db):
    print(f"#### Dumping local {db}")
    subprocess.run(make_dump_command(local_opts, db))
    print(f"#### Dumping remote {db} (backup)")
    subprocess.run(make_dump_command2(remote_opts, db))
    print(f"#### Dropping remote {db} ")
    subprocess.run(make_drop_command(remote_opts, db))
    print(f"#### Restoring remote {db}")
    subprocess.run(make_restore_command(remote_opts, db))


for db in dbs_to_dump:
    run_stages(db)

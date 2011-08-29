# 0.7.0

* added support for arbitrary paths in `nano.request`
* document paths are now EncodeURIComponent by default, use path to override
* new error handling code, hopefully more readable
* added auto db.use when a database is present in the uri that was provided
* updated to request 2.1.1 on frozen deps